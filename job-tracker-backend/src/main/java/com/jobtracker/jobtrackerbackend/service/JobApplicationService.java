package com.jobtracker.jobtrackerbackend.service;

import com.jobtracker.jobtrackerbackend.model.JobApplication;
import com.jobtracker.jobtrackerbackend.model.User;
import com.jobtracker.jobtrackerbackend.repository.JobApplicationRepository;
import com.jobtracker.jobtrackerbackend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final UserRepository userRepository;

    public JobApplicationService(JobApplicationRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public List<JobApplication> getAllJobsByUser(Long userId) {
        return repository.findByUserId(userId);
    }

    public JobApplication saveJob(Long userId, JobApplication jobApplication) {
        User user = userRepository.findById(userId).orElseThrow();
        jobApplication.setUser(user);
        return repository.save(jobApplication);
    }

    public JobApplication updateJob(Long userId, Long jobId, JobApplication updatedJob) {
        JobApplication existingJob = repository.findById(jobId).orElseThrow();

        if (existingJob.getUser() == null || !existingJob.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to update this job");
        }

        existingJob.setCompany(updatedJob.getCompany());
        existingJob.setPosition(updatedJob.getPosition());
        existingJob.setStatus(updatedJob.getStatus());
        existingJob.setDateApplied(updatedJob.getDateApplied());
        existingJob.setNotes(updatedJob.getNotes());

        return repository.save(existingJob);
    }

    public void deleteJob(Long userId, Long jobId) {
        JobApplication existingJob = repository.findById(jobId).orElseThrow();

        if (existingJob.getUser() == null || !existingJob.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to delete this job");
        }

        repository.deleteById(jobId);
    }
}