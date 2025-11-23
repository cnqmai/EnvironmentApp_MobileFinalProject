package com.enviro.app.environment_backend.controller;

import org.springframework.web.bind.annotation.RestController; // Bắt buộc
import org.springframework.web.bind.annotation.RequestMapping;
// ... các import khác

@RestController // <--- CHẮC CHẮN LÀ @RestController (không phải @Controller)
@RequestMapping("/api/auth")
public class AuthController {
   // ...
}