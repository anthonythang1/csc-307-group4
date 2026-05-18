package com.slorentalregistry.backend;

import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
public class RootController {
    @GetMapping("/")
    public String home() {
        return "SLORR Backroot";
    }
}
