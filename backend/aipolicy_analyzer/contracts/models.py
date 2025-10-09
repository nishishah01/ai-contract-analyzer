from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVector

User = get_user_model()


class Document(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="contracts/")
    text_content = models.TextField(blank=True, null=True)  # extracted text
    analysis = models.JSONField(blank=True, null=True)  # AI output
    uploaded_at = models.DateTimeField(auto_now_add=True)
    search_vector = SearchVectorField(null=True)

    def __str__(self):
        return f"{self.file.name} ({self.owner.email})"

    class Meta:
        indexes = [GinIndex(fields=["search_vector"])]#for full-text search
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.text_content:
            Document.objects.filter(pk=self.pk).update(
                search_vector=SearchVector('text_content', config='english')
            )


class AnalysisCache(models.Model):
    file_hash = models.CharField(max_length=128, unique=True, db_index=True)
    result_json = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cache {self.file_hash[:8]} - {self.created_at.isoformat()}"
