package com.jobtracker.jobtrackerbackend.controller;

import com.jobtracker.jobtrackerbackend.model.JobApplication;
import com.jobtracker.jobtrackerbackend.service.JobApplicationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public List<JobApplication> getAllJobs(@PathVariable Long userId) {
        return service.getAllJobsByUser(userId);
    }

    @PostMapping("/{userId}")
    public JobApplication createJob(@PathVariable Long userId, @RequestBody JobApplication jobApplication) {
        return service.saveJob(userId, jobApplication);
    }

    @PutMapping("/{userId}/{jobId}")
    public JobApplication updateJob(
            @PathVariable Long userId,
            @PathVariable Long jobId,
            @RequestBody JobApplication jobApplication
    ) {
        return service.updateJob(userId, jobId, jobApplication);
    }

    @DeleteMapping("/{userId}/{jobId}")
    public void deleteJob(@PathVariable Long userId, @PathVariable Long jobId) {
        service.deleteJob(userId, jobId);
    }
}