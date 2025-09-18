package com.example.data_final_mobile;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test")
    public String getTestData() {
        return "Back-end Spring Boot đã hoạt động thành công!";
    }
}