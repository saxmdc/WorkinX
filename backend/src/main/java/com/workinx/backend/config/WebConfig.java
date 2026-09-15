package com.workinx.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Paths;

/**
 * Sirve los archivos de uploads como recursos estáticos.
 * Equivalente a: app.use("/uploads", express.static(path.join(__dirname, "../uploads")))
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(uploadsDir).toAbsolutePath().toString();
        // Asegurar separador correcto en Windows
        if (!absolutePath.endsWith(File.separator)) {
            absolutePath = absolutePath + File.separator;
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath);

    }
}
