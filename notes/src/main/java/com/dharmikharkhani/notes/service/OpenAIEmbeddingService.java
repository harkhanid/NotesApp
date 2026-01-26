package com.dharmikharkhani.notes.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Service
public class OpenAIEmbeddingService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIEmbeddingService.class);

    private final WebClient webClient;

    @Value("${openai.embedding.model}")
    private String embeddingModel;

    @Value("${openai.embedding.dimensions}")
    private int embeddingDimensions;

    public OpenAIEmbeddingService(
            @Value("${openai.api.key}") String apiKey,
            @Value("${openai.api.url}") String apiUrl
    ) {
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /**
     * Generate embeddings for the given text using OpenAI API
     *
     * @param text The text to generate embeddings for
     * @return Float array representing the embedding vector
     * @throws RuntimeException if the API call fails
     */
    public float[] generateEmbedding(String text) {
        if (text == null || text.trim().isEmpty()) {
            logger.warn("Attempted to generate embedding for empty text");
            return new float[embeddingDimensions];
        }

        try {
            logger.debug("Generating embedding for text of length: {}", text.length());

            Map<String, Object> requestBody = Map.of(
                    "input", text,
                    "model", embeddingModel,
                    "dimensions", embeddingDimensions
            );

            EmbeddingResponse response = webClient.post()
                    .uri("/embeddings")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(EmbeddingResponse.class)
                    .block();

            if (response != null && response.data != null && !response.data.isEmpty()) {
                List<Double> embeddingList = response.data.get(0).embedding;
                float[] embedding = new float[embeddingList.size()];
                for (int i = 0; i < embeddingList.size(); i++) {
                    embedding[i] = embeddingList.get(i).floatValue();
                }

                logger.debug("Successfully generated embedding of dimension: {}", embedding.length);
                return embedding;
            } else {
                logger.error("Invalid response from OpenAI API: empty data");
                throw new RuntimeException("Failed to generate embedding: empty response");
            }

        } catch (WebClientResponseException e) {
            logger.error("OpenAI API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to generate embedding: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Error generating embedding", e);
            throw new RuntimeException("Failed to generate embedding: " + e.getMessage(), e);
        }
    }

    /**
     * Generate embedding from note content (title + content)
     * This method combines and formats note fields for optimal embedding generation
     *
     * @param title Note title
     * @param content Note content (HTML)
     * @return Float array representing the embedding vector
     */
    public float[] generateNoteEmbedding(String title, String content) {
        // Strip HTML tags from content for better embedding quality
        String cleanContent = content != null ? stripHtml(content) : "";
        String cleanTitle = title != null ? title : "";

        // Combine title and content with special formatting
        String combinedText = String.format("Title: %s\n\nContent: %s",
                cleanTitle.trim(),
                cleanContent.trim());

        return generateEmbedding(combinedText);
    }

    /**
     * Simple HTML tag stripper for better text embedding
     *
     * @param html HTML content
     * @return Plain text without HTML tags
     */
    private String stripHtml(String html) {
        if (html == null) return "";
        return html
                .replaceAll("<[^>]*>", " ")  // Remove HTML tags
                .replaceAll("&nbsp;", " ")   // Replace HTML entities
                .replaceAll("\\s+", " ")     // Normalize whitespace
                .trim();
    }

    // DTOs for OpenAI API response
    private static class EmbeddingResponse {
        public List<EmbeddingData> data;
        public String model;
        public Usage usage;
    }

    private static class EmbeddingData {
        public List<Double> embedding;
        public int index;
    }

    private static class Usage {
        public int prompt_tokens;
        public int total_tokens;
    }
}
