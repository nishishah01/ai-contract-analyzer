from django.core.management.base import BaseCommand
from django.contrib.postgres.search import SearchVector
from contracts.models import Document


class Command(BaseCommand):
    help = 'Updates search_vector field for all documents with text_content'

    def handle(self, *args, **options):
        documents = Document.objects.filter(text_content__isnull=False)
        total = documents.count()

        self.stdout.write(f"Updating search vectors for {total} documents...")

        updated = documents.update(
            search_vector=SearchVector('text_content', config='english')
        )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated} document search vectors')
        )
