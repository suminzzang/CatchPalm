package com.ssafy.catchpalm.api.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    void store(MultipartFile file);
    Resource load(String filename);
    void delete(String filename);
}
