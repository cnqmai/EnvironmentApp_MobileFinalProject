package com.enviro.app.environment_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration; // Import cần thiết

// BỔ SUNG: exclude = SecurityAutoConfiguration.class
@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class EnvironmentBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(EnvironmentBackendApplication.class, args);
	}

}