package com.dharmikharkhani.notes.service;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DemoAccountResetService {

    private static final Logger logger = LoggerFactory.getLogger(DemoAccountResetService.class);
    private static final int INACTIVITY_THRESHOLD_HOURS = 2;

    private final UserRepository userRepository;
    private final DemoAccountService demoAccountService;

    public DemoAccountResetService(UserRepository userRepository, DemoAccountService demoAccountService) {
        this.userRepository = userRepository;
        this.demoAccountService = demoAccountService;
    }

    /**
     * DISABLED: Scheduled job that runs every hour to reset inactive demo accounts
     *
     * This cron-based reset has been replaced with login-time reset in AuthController.
     * Demo accounts are now reset immediately when users log in after 2 hours of inactivity,
     * providing better UX and reducing unnecessary background processing.
     *
     * Kept here for reference and potential manual/emergency resets if needed.
     * To re-enable: uncomment @Scheduled annotation below.
     *
     * Cron expression: "0 0 * * * *" = At minute 0 of every hour
     */
    // @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void resetInactiveDemoAccounts() {
        logger.info("Starting scheduled demo account reset job");

        LocalDateTime threshold = LocalDateTime.now().minusHours(INACTIVITY_THRESHOLD_HOURS);

        // Find demo accounts that have been inactive for more than INACTIVITY_THRESHOLD_HOURS
        List<User> inactiveDemoUsers = userRepository.findByIsDemoAccountTrueAndLastActivityAtBefore(threshold);

        if (inactiveDemoUsers.isEmpty()) {
            logger.info("No inactive demo accounts found");
            return;
        }

        logger.info("Found {} inactive demo accounts to reset", inactiveDemoUsers.size());

        int resetCount = 0;
        for (User user : inactiveDemoUsers) {
            try {
                demoAccountService.resetDemoAccount(user);
                resetCount++;
            } catch (Exception e) {
                logger.error("Failed to reset demo account {}: {}", user.getEmail(), e.getMessage(), e);
            }
        }

        logger.info("Demo account reset job completed. Reset {} out of {} accounts",
                    resetCount, inactiveDemoUsers.size());
    }

    /**
     * Manual trigger for resetting all demo accounts (useful for admin/testing)
     */
    @Transactional
    public void resetAllDemoAccounts() {
        logger.info("Manual reset of all demo accounts triggered");

        List<User> allDemoUsers = userRepository.findByIsDemoAccountTrue();

        if (allDemoUsers.isEmpty()) {
            logger.info("No demo accounts found");
            return;
        }

        int resetCount = 0;
        for (User user : allDemoUsers) {
            try {
                demoAccountService.resetDemoAccount(user);
                resetCount++;
            } catch (Exception e) {
                logger.error("Failed to reset demo account {}: {}", user.getEmail(), e.getMessage(), e);
            }
        }

        logger.info("Manual reset completed. Reset {} demo accounts", resetCount);
    }
}
