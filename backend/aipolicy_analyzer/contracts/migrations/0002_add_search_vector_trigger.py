from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contracts', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE OR REPLACE FUNCTION update_document_search_vector()
            RETURNS trigger AS $$
            BEGIN
                IF NEW.text_content IS NOT NULL THEN
                    NEW.search_vector := to_tsvector('english', COALESCE(NEW.text_content, ''));
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS document_search_vector_update ON contracts_document;

            CREATE TRIGGER document_search_vector_update
            BEFORE INSERT OR UPDATE OF text_content
            ON contracts_document
            FOR EACH ROW
            EXECUTE FUNCTION update_document_search_vector();
            """,
            reverse_sql="""
            DROP TRIGGER IF EXISTS document_search_vector_update ON contracts_document;
            DROP FUNCTION IF EXISTS update_document_search_vector();
            """
        ),
    ]
