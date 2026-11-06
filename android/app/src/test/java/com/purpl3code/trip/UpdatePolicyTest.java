package com.purpl3code.trip;

import org.junit.Test;
import static org.junit.Assert.*;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;

public class UpdatePolicyTest {
    @Test public void acceptsOnlyTripReleaseApks() {
        assertTrue(UpdatePolicy.trustedDownload("https://github.com/purpl3code/Trip/releases/download/apk-32/Trip.apk"));
        assertFalse(UpdatePolicy.trustedDownload("http://github.com/purpl3code/Trip/releases/download/apk-32/Trip.apk"));
        assertFalse(UpdatePolicy.trustedDownload("https://github.com/other/Trip/releases/download/apk-32/Trip.apk"));
        assertFalse(UpdatePolicy.trustedDownload("https://github.com.evil.test/purpl3code/Trip/releases/download/apk-32/Trip.apk"));
        assertFalse(UpdatePolicy.trustedDownload("https://github.com/purpl3code/Trip/releases/download/../Trip.apk"));
        assertFalse(UpdatePolicy.trustedDownload("https://github.com/purpl3code/Trip/releases/download/%2e%2e/Trip.apk"));
        assertFalse(UpdatePolicy.trustedDownload("https://github.com/purpl3code/Trip/releases/download/apk-32/Trip.apk?redirect=other"));
        assertFalse(UpdatePolicy.trustedDownload("not a url"));
    }
    @Test public void detectsTamperedDownloads() throws Exception {
        byte[] actual = MessageDigest.getInstance("SHA-256").digest("Trip".getBytes(StandardCharsets.UTF_8));
        assertTrue(UpdatePolicy.matchesHash(UpdatePolicy.hex(actual), actual));
        assertFalse(UpdatePolicy.matchesHash("0".repeat(64), actual));
        assertFalse(UpdatePolicy.matchesHash("bad", actual));
        assertFalse(UpdatePolicy.matchesHash(null, actual));
    }
}
