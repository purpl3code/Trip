package com.purpl3code.trip;

import java.net.URI;
import java.security.MessageDigest;

public final class UpdatePolicy {
    private UpdatePolicy() {}

    public static boolean trustedDownload(String value) {
        try {
            URI uri = new URI(value);
            String path = uri.getRawPath();
            return "https".equalsIgnoreCase(uri.getScheme())
                && "github.com".equalsIgnoreCase(uri.getHost())
                && uri.getUserInfo() == null && (uri.getPort() == -1 || uri.getPort() == 443)
                && uri.getRawQuery() == null && uri.getRawFragment() == null
                && path != null && !path.contains("%") && uri.normalize().equals(uri)
                && path.startsWith("/purpl3code/Trip/releases/download/")
                && path.endsWith("/Trip.apk");
        } catch (Exception e) { return false; }
    }

    public static String hex(byte[] bytes) {
        StringBuilder out = new StringBuilder();
        for (byte b : bytes) out.append(String.format(java.util.Locale.ROOT, "%02x", b & 255));
        return out.toString();
    }

    public static boolean matchesHash(String expected, byte[] digest) {
        return expected != null && expected.matches("[a-fA-F0-9]{64}")
            && MessageDigest.isEqual(expected.toLowerCase(java.util.Locale.ROOT).getBytes(java.nio.charset.StandardCharsets.US_ASCII),
                hex(digest).getBytes(java.nio.charset.StandardCharsets.US_ASCII));
    }
}
