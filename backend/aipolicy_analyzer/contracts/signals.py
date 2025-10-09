# contracts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Document
from django.dispatch import receiver
from django.contrib.postgres.search import SearchVector
from .services.analysis_pipeline import run_analysis_pipeline

@receiver(post_save, sender=Document)
def auto_run_analysis(sender, instance: Document, created, **kwargs):
    if created:
        # synchronous run (blocking). If you later add Celery, call .delay()
        try:
            run_analysis_pipeline(instance)
        except Exception:
            # swallow so upload doesn't fail due to analysis errors
            pass

@receiver(post_save, sender=Document)
def update_search_vector(sender, instance, **kwargs):
    """Automatically updates the search vector when a document is saved."""
    if kwargs.get('update_fields') is not None:
        return
    
    if instance.text_content:
        Document.objects.filter(id=instance.id).update(
            search_vector=SearchVector('text_content', config='english')
        )