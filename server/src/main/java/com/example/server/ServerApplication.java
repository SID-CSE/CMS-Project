package com.example.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@RestController
public class ServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}

	@GetMapping("/")
	public Map<String, String> root() {
		Map<String, String> response = new HashMap<>();
		response.put("message", "Contify CMS Backend Server is running");
		response.put("version", "1.0.0");
		response.put("status", "OK");
		return response;
	}

	@GetMapping({"/health", "/api/health"})
	public Map<String, String> health(){
		Map<String, String> response = new HashMap<>();
		response.put("status", "UP");
		response.put("service", "Contify CMS");
		return response;
	}

}
