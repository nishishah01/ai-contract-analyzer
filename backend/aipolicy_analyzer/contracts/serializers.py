from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'owner','text_content','analysis', 'file', 'uploaded_at']
        read_only_fields = ['owner', 'text_content','analysis', 'uploaded_at']
