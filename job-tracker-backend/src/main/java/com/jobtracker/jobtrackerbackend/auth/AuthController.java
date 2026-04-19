package com.jobtracker.jobtrackerbackend.auth;

import com.jobtracker.jobtrackerbackend.model.User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> body) {
        return authService.login(body.get("email"), body.get("password"));
    }
}