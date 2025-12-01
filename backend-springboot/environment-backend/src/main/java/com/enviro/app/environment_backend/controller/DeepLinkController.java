package com.enviro.app.environment_backend.controller;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URI;
import java.util.Map;

@RestController
public class DeepLinkController {

    // [CẬP NHẬT QUAN TRỌNG] Sử dụng link exp:// của phiên làm việc Metro
    private static final String EXPO_DEV_URL = "exp://ze8itke-cnqmai-8081.exp.direct"; 

    /**
     * Bắt các yêu cầu Deep Link và chuyển hướng sang môi trường Expo Go
     */
    @GetMapping("/community/post/{id}")
    public ResponseEntity<Void> handlePostDeepLink(
        @PathVariable String id,
        @RequestParam Map<String, String> params) 
    {
        
        // Cấu trúc Deep Link của Expo Router: exp://host/--/path
        // Hoặc đơn giản là exp://host/path nếu chạy qua link publish
        String deepLinkUri = EXPO_DEV_URL + "/--/community/post/" + id;
        
        // Hoặc sử dụng cấu trúc đơn giản hơn (thường hoạt động tốt hơn):
        // String deepLinkUri = EXPO_DEV_URL + "/community/post/" + id;


        // Thiết lập Header chuyển hướng (302 FOUND)
        HttpHeaders headers = new HttpHeaders();
        
        // Chuyển hướng trình duyệt/hệ điều hành sang link exp://
        headers.setLocation(URI.create(deepLinkUri));

        // Trả về 302 FOUND
        return new ResponseEntity<>(headers, HttpStatus.FOUND); 
    }
}