package com.dharmikharkhani.notes.entity.pgvector;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA Converter for PostgreSQL vector type
 * Converts between Java String and PostgreSQL vector(1536)
 */
@Converter
public class VectorTypeConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        // Return the string as-is, PostgreSQL will handle the cast via columnDefinition
        return attribute;
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        // Return the vector as string
        return dbData;
    }
}
