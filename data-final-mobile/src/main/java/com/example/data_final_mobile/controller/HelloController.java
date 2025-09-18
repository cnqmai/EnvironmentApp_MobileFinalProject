package com.example.data_final_mobile.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // Đánh dấu đây là một REST Controller
public class HelloController {

    @GetMapping("/hello") // Ánh xạ yêu cầu GET tới đường dẫn "/hello"
    public String sayHello() {
        return "Hello, World!";
    }
}