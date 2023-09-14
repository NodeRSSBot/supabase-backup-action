import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ["**/*.test.ts"],
        includeSource: ["./src/**"],
        coverage: {
            enabled: true,
            reporter: ['text', 'html', 'json-summary'],
        },
        server: {
            deps: {
                inline: ['zx']
            }
        }
    },
})