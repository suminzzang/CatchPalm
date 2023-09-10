package com.ssafy.catchpalm.api.service;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class LocalStorageServiceImpl implements StorageService {

    String homeDirectory = System.getProperty("user.home");
    private final Path rootLocation;
    private final ResourceLoader resourceLoader;

    public LocalStorageServiceImpl(ResourceLoader resourceLoader) {
        this.rootLocation = Paths.get(homeDirectory, "Documents", "CatchPalm");
        this.resourceLoader = resourceLoader;
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    @Override
    public void store(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file " + file.getOriginalFilename());
            }
            Files.copy(file.getInputStream(), this.rootLocation.resolve(file.getOriginalFilename()));
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), e);
        }
    }

    @Override
    public Resource load(String filename) {
        return resourceLoader.getResource("file:" + rootLocation.resolve(filename).toString());
    }

    @Override
    public void delete(String filename) {
        try {
            Files.delete(rootLocation.resolve(filename));
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file " + filename, e);
        }
    }
}