package com.workinx.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WorkinxApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkinxApplication.class, args);
        System.out.println("✅ Servidor WorkInX (Spring Boot) corriendo en http://localhost:3000");
    }
}
