package com.enviro.app.environment_backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FacebookUser {
    private String id;
    private String name;
    private String email;
    private Picture picture;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Picture {
        private PictureData data;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PictureData {
        private String url;
    }
}