package com.purpl3code.trip;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import org.json.JSONObject;

@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {
    private static final String MANIFEST = "https://github.com/purpl3code/Trip/releases/latest/download/update.json";
    private static final long MAX_APK_BYTES = 100L * 1024 * 1024;
    private final AtomicBoolean downloading = new AtomicBoolean(false);
    private volatile String pendingHash;
    private volatile long pendingVersion;

    private File apkFile() { return new File(getContext().getCacheDir(), "trip-updates/Trip.apk"); }

    @SuppressWarnings("deprecation")
    private PackageInfo installed() throws Exception {
        return getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
    }

    @SuppressWarnings("deprecation")
    private long version(PackageInfo info) {
        return Build.VERSION.SDK_INT >= 28 ? info.getLongVersionCode() : info.versionCode;
    }

    private HttpURLConnection connect(String address) throws Exception {
        URL url = new URL(address);
        for (int hop = 0; hop < 6; hop++) {
            if (!"https".equalsIgnoreCase(url.getProtocol())) throw new Exception("Endereço de atualização inválido.");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setInstanceFollowRedirects(false);
            connection.setConnectTimeout(15000); connection.setReadTimeout(30000);
            connection.setRequestProperty("User-Agent", "Trip-Android-Updater");
            connection.setRequestProperty("Accept", "application/octet-stream, application/json");
            int status = connection.getResponseCode();
            if (status >= 300 && status < 400) {
                String location = connection.getHeaderField("Location");
                connection.disconnect();
                if (location == null) throw new Exception("Redirecionamento de atualização inválido.");
                URL next = new URL(url, location);
                String host = next.getHost().toLowerCase(java.util.Locale.ROOT);
                if (!host.equals("github.com") && !host.equals("release-assets.githubusercontent.com")
                    && !host.equals("objects.githubusercontent.com")) throw new Exception("Origem de atualização inválida.");
                url = next; continue;
            }
            if (status != 200) { connection.disconnect(); throw new Exception(status == 404
                ? "Ainda não há informações de atualização publicadas. Tente novamente mais tarde."
                : "Não foi possível consultar o GitHub. Tente novamente mais tarde."); }
            return connection;
        }
        throw new Exception("Não foi possível seguir o download da atualização.");
    }

    private JSONObject manifest() throws Exception {
        HttpURLConnection connection = connect(MANIFEST);
        try (InputStream input = connection.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096]; int read;
            while ((read = input.read(buffer)) != -1) {
                if (out.size() + read > 65536) throw new Exception("Informações de atualização inválidas.");
                out.write(buffer, 0, read);
            }
            JSONObject data = new JSONObject(out.toString("UTF-8"));
            if (!getContext().getPackageName().equals(data.getString("applicationId"))
                || !UpdatePolicy.trustedDownload(data.getString("downloadUrl"))
                || !data.getString("sha256").matches("[a-fA-F0-9]{64}")
                || data.getLong("versionCode") <= 0 || data.getString("versionName").trim().isEmpty())
                throw new Exception("Informações de atualização inválidas.");
            return data;
        } finally { connection.disconnect(); }
    }

    @PluginMethod
    public void check(PluginCall call) {
        execute(() -> {
            try {
                PackageInfo current = installed();
                JSONObject latest = manifest();
                JSObject result = new JSObject();
                result.put("currentVersion", current.versionName);
                result.put("currentVersionCode", version(current));
                result.put("available", latest.getLong("versionCode") > version(current));
                result.put("latestVersion", latest.getString("versionName"));
                result.put("notes", latest.optString("releaseNotes", "Melhorias e correções do Trip."));
                call.resolve(result);
            } catch (Exception error) { call.reject(friendly(error), error); }
        });
    }

    private String friendly(Exception error) {
        if (error instanceof java.io.IOException)
            return "Não foi possível conectar. Verifique sua internet e tente novamente.";
        return error.getMessage() == null ? "Não foi possível atualizar. Tente novamente." : error.getMessage();
    }

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        if (!downloading.compareAndSet(false, true)) { call.reject("Uma atualização já está sendo baixada."); return; }
        execute(() -> {
            File part = new File(apkFile().getParentFile(), "Trip.apk.part");
            try {
                JSONObject latest = manifest();
                if (latest.getLong("versionCode") <= version(installed()))
                    throw new Exception("Você já está na versão mais recente.");
                File destination = apkFile();
                if (!destination.getParentFile().isDirectory() && !destination.getParentFile().mkdirs())
                    throw new Exception("Não foi possível preparar o download.");
                HttpURLConnection connection = connect(latest.getString("downloadUrl"));
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                long downloaded = 0, total = connection.getContentLengthLong();
                if (total > MAX_APK_BYTES) { connection.disconnect(); throw new Exception("Arquivo de atualização muito grande."); }
                long started = System.currentTimeMillis(), lastNotification = 0;
                try (InputStream input = connection.getInputStream(); FileOutputStream output = new FileOutputStream(part)) {
                    byte[] buffer = new byte[32768]; int read;
                    while ((read = input.read(buffer)) != -1) {
                        downloaded += read;
                        if (downloaded > MAX_APK_BYTES || System.currentTimeMillis() - started > 300000)
                            throw new Exception("O download demorou demais. Tente novamente.");
                        output.write(buffer, 0, read); digest.update(buffer, 0, read);
                        if (System.currentTimeMillis() - lastNotification > 250) {
                            JSObject progress = new JSObject();
                            progress.put("percent", total > 0 ? Math.min(99, downloaded * 100 / total) : -1);
                            notifyListeners("downloadProgress", progress);
                            lastNotification = System.currentTimeMillis();
                        }
                    }
                } finally { connection.disconnect(); }
                if (!UpdatePolicy.matchesHash(latest.getString("sha256"), digest.digest()))
                    throw new Exception("O download não passou pela verificação. Tente novamente.");
                if (destination.exists() && !destination.delete()) throw new Exception("Não foi possível substituir o download anterior.");
                if (!part.renameTo(destination)) throw new Exception("Não foi possível salvar a atualização.");
                pendingHash = latest.getString("sha256"); pendingVersion = latest.getLong("versionCode");
                validateArchive(destination);
                showInstaller(call);
            } catch (Exception error) {
                part.delete(); apkFile().delete(); pendingHash = null;
                call.reject(friendly(error), error);
            } finally { downloading.set(false); }
        });
    }

    @SuppressWarnings("deprecation")
    private Set<String> signatures(PackageInfo info) throws Exception {
        Signature[] certificates = Build.VERSION.SDK_INT >= 28
            ? (info.signingInfo == null ? new Signature[0] : info.signingInfo.getApkContentsSigners())
            : info.signatures;
        Set<String> values = new HashSet<>();
        if (certificates != null) for (Signature cert : certificates)
            values.add(UpdatePolicy.hex(MessageDigest.getInstance("SHA-256").digest(cert.toByteArray())));
        return values;
    }

    @SuppressWarnings("deprecation")
    private void validateArchive(File file) throws Exception {
        if (pendingHash == null || !file.isFile()) throw new Exception("Baixe a atualização novamente.");
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream input = new java.io.FileInputStream(file)) {
            byte[] bytes = new byte[32768]; int count;
            while ((count = input.read(bytes)) != -1) digest.update(bytes, 0, count);
        }
        if (!UpdatePolicy.matchesHash(pendingHash, digest.digest())) throw new Exception("Arquivo de atualização inválido.");
        PackageManager manager = getContext().getPackageManager();
        int flags = Build.VERSION.SDK_INT >= 28 ? PackageManager.GET_SIGNING_CERTIFICATES : PackageManager.GET_SIGNATURES;
        PackageInfo archive = manager.getPackageArchiveInfo(file.getAbsolutePath(), flags);
        PackageInfo current = manager.getPackageInfo(getContext().getPackageName(), flags);
        if (archive == null || !current.packageName.equals(archive.packageName)
            || version(archive) != pendingVersion || version(archive) <= version(current))
            throw new Exception("Este arquivo não é uma atualização válida do Trip.");
        Set<String> installedSignatures = signatures(current);
        if (installedSignatures.isEmpty() || !installedSignatures.equals(signatures(archive)))
            throw new Exception("A assinatura da atualização não corresponde ao Trip instalado.");
    }

    @PluginMethod
    public void installDownloaded(PluginCall call) {
        execute(() -> {
            try { validateArchive(apkFile()); showInstaller(call); }
            catch (Exception error) { call.reject(friendly(error), error); }
        });
    }

    private void showInstaller(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                JSObject result = new JSObject();
                if (Build.VERSION.SDK_INT >= 26 && !getContext().getPackageManager().canRequestPackageInstalls()) {
                    Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:" + getContext().getPackageName()));
                    getActivity().startActivity(settings);
                    result.put("status", "permissionRequired");
                } else {
                    Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", apkFile());
                    Intent install = new Intent(Intent.ACTION_VIEW);
                    install.setDataAndType(uri, "application/vnd.android.package-archive");
                    install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    getActivity().startActivity(install);
                    result.put("status", "installerOpened");
                }
                call.resolve(result);
            } catch (Exception error) { call.reject("Não foi possível abrir o instalador do Android.", error); }
        });
    }
}
