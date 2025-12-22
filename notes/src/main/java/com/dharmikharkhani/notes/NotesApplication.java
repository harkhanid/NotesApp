package com.dharmikharkhani.notes;

import com.dharmikharkhani.notes.service.DemoAccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class NotesApplication {

	private static final Logger logger = LoggerFactory.getLogger(NotesApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(NotesApplication.class, args);
	}

	@Bean
	CommandLineRunner initDemoAccounts(DemoAccountService demoAccountService) {
		return args -> {
			logger.info("Initializing demo accounts...");

			// Create 5 demo accounts with different personas
			demoAccountService.createDemoAccount(
					"Demo Product Manager",
					"demo-pm@notesapp.com",
					"Demo123!",
					"product-manager"
			);

			demoAccountService.createDemoAccount(
					"Demo Developer",
					"demo-dev@notesapp.com",
					"Demo123!",
					"developer"
			);

			demoAccountService.createDemoAccount(
					"Demo Designer",
					"demo-design@notesapp.com",
					"Demo123!",
					"designer"
			);

			demoAccountService.createDemoAccount(
					"Demo Writer",
					"demo-writer@notesapp.com",
					"Demo123!",
					"writer"
			);

			demoAccountService.createDemoAccount(
					"Demo Student",
					"demo-student@notesapp.com",
					"Demo123!",
					"student"
			);

			logger.info("Demo accounts created, setting up note sharing...");

			// Share notes between demo accounts
			demoAccountService.shareNotesBetweenDemoAccounts();

			logger.info("Demo accounts initialization complete");
		};
	}

}
