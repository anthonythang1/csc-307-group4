package com.slorentalregistry.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {

		/* env variables for supabase DB */
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
		if(dotenv.get("DB_URL") != null){
			System.setProperty("DB_URL", dotenv.get("DB_URL"));
		}
		if (dotenv.get("DB_USER") != null) {
			System.setProperty("DB_USER", dotenv.get("DB_USER"));
		}
		if (dotenv.get("DB_PASSWORD") != null) {
			System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));
		}


		SpringApplication.run(BackendApplication.class, args);
	}
}
