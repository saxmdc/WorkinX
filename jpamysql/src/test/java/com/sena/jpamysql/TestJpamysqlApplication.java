package com.sena.jpamysql;

import org.springframework.boot.SpringApplication;

public class TestJpamysqlApplication {

	public static void main(String[] args) {
		SpringApplication.from(JpamysqlApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
