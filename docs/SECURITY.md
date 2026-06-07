# Electron Security Documentation

## Overview

DropLAN uses Electron to provide a cross-platform desktop application with security-first principles. This document outlines all security measures implemented.

## Security Settings

All Electron windows are configured with mandatory security settings:

```typescript
webPreferences: {
  contextIsolation: true,      // Renderer cannot access Node.js APIs
  sandbox: true,               // Renderer runs in sandboxed environment
  nodeIntegration: false,      // No require() in renderer
  webSecurity: true            // Strict CORS enforcement
}
```

### Why Each Setting Matters

- **contextIsolation**: Prevents renderer from accessing dangerous Node.js APIs
- **sandbox**: Additional OS-level process isolation
- **nodeIntegration**: Eliminates require() which could load any Node.js module
- **webSecurity**: Prevents loading resources from untrusted sources

## IPC Communication

### Channel Whitelist

Only specific IPC channels are allowed:

**Invoke Channels (Renderer → Main):**

- `server:status` — Get server status
- `app:quit` — Gracefully quit application
- `app:getVersion` — Get app version
- `app:openDevTools` — Toggle developer tools

**Send Channels (Main → Renderer):**

- `server:status` — Server status updates
- `transfer:progress` — Transfer progress notifications
- `transfer:complete` — Transfer completion notification
- `error:fatal` — Fatal error notification

### Validation

All IPC channels are validated:

1. Request comes through contextBridge wrapper
2. Channel is checked against whitelist
3. Only whitelisted channels are allowed
4. Unauthorized attempts throw errors

## Preload Script

The preload script uses `contextBridge` to safely expose only necessary APIs:

```typescript
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, args) => ipcRenderer.invoke(channel, args),
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback),
});
```

All channel access is validated before calling the underlying ipcRenderer methods.

## What's NOT Exposed

Renderer process has NO access to:

- ✗ `process` object
- ✗ `require()` function
- ✗ `eval()` or `Function()` constructor
- ✗ File system APIs (fs, fs/promises)
- ✗ Child process APIs
- ✗ Operating system APIs
- ✗ Any other Node.js modules

## Production vs Development

**Development Mode:**

- Dev tools enabled for debugging
- Vite dev server loaded over localhost
- Full source maps for debugging

**Production Mode:**

- Dev tools disabled
- Packaged app loaded from dist
- No access to development features
- Code minified and obfuscated

## Security Audit Checklist

- ✓ Context isolation enabled
- ✓ Sandbox enabled
- ✓ Node integration disabled
- ✓ Preload script implemented
- ✓ IPC channels whitelisted
- ✓ Dev tools only in development
- ✓ No eval() or Function()
- ✓ HTTPS enforced for external resources

## Security Best Practices

### When Adding New IPC Channels

1. **Define the channel in types**: Add to `IpcInvokeChannels` or `IpcSendChannels`
2. **Add to whitelist**: Update `ALLOWED_INVOKE_CHANNELS` or `ALLOWED_SEND_CHANNELS` in `security.ts`
3. **Implement in main**: Handle in `ipcMain.handle()` in `main.ts`
4. **Test validation**: Ensure channel validation tests pass
5. **Document in this file**

### Code Review Checklist

- [ ] No use of `eval()`
- [ ] No use of `Function()` constructor
- [ ] No dynamic require()
- [ ] All IPC channels whitelisted
- [ ] No access to `process` object
- [ ] No dangerouslySetInnerHTML equivalents
- [ ] No loading of arbitrary external resources
- [ ] Security test coverage added

## Known Limitations

- Single-process mode is disabled (security requirement)
- No arbitrary script execution
- No access to user's file system outside app directories
- Limited to IPC for main process communication

## Further Reading

- [Electron Security Documentation](https://www.electronjs.org/docs/tutorial/security)
- [OWASP Security Guidelines](https://owasp.org/www-project-desktop-app-security-top-10/)
- [Chromium Security](https://chromium.googlesource.com/chromium/src/+/main/docs/security/index.md)
