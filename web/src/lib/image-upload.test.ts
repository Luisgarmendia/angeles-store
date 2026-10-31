import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = mocks.send
  },
  PutObjectCommand: class {
    input: Record<string, unknown>
    constructor(input: Record<string, unknown>) {
      this.input = input
    }
  },
}))

import { sniffImageFormat, uploadImage } from "./r2"

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])
const WEBP = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
])
const AVIF = new Uint8Array([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66,
])
const HTML = new TextEncoder().encode("<html><script>alert(1)</script></html>")
const JS = new TextEncoder().encode("export default () => alert(1)")
const GIF = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])

describe("sniffImageFormat", () => {
  it("detects JPEG bytes", () => {
    expect(sniffImageFormat(JPEG)).toEqual({ extension: "jpg", contentType: "image/jpeg" })
  })

  it("detects PNG bytes", () => {
    expect(sniffImageFormat(PNG)).toEqual({ extension: "png", contentType: "image/png" })
  })

  it("detects WebP bytes", () => {
    expect(sniffImageFormat(WEBP)).toEqual({ extension: "webp", contentType: "image/webp" })
  })

  it("detects AVIF bytes", () => {
    expect(sniffImageFormat(AVIF)).toEqual({ extension: "avif", contentType: "image/avif" })
  })

  it("returns null for HTML bytes", () => {
    expect(sniffImageFormat(HTML)).toBeNull()
  })

  it("returns null for JavaScript bytes", () => {
    expect(sniffImageFormat(JS)).toBeNull()
  })

  it("returns null for an unsupported image format (GIF)", () => {
    expect(sniffImageFormat(GIF)).toBeNull()
  })

  it("returns null for an empty buffer", () => {
    expect(sniffImageFormat(new Uint8Array(0))).toBeNull()
  })
})

describe("uploadImage", () => {
  beforeEach(() => {
    mocks.send.mockReset()
    process.env.R2_ENDPOINT = "https://r2.example.com"
    process.env.R2_BUCKET = "bucket"
    process.env.R2_ACCESS_KEY_ID = "key"
    process.env.R2_SECRET_ACCESS_KEY = "secret"
    process.env.R2_PUBLIC_URL = "https://cdn.example.com/"
  })

  it("rejects bytes that are HTML even when declared as an image", async () => {
    const file = new File([HTML], "evil.png", { type: "image/png" })

    await expect(uploadImage(file, "productos")).rejects.toThrow(
      "Formato no permitido. Usá JPG, PNG, WEBP o AVIF.",
    )
    expect(mocks.send).not.toHaveBeenCalled()
  })

  it("stores a real image using the sniffed format instead of the declared type", async () => {
    const file = new File([PNG], "photo.jpg", { type: "image/jpeg" })

    const url = await uploadImage(file, "productos")

    expect(url).toMatch(/^https:\/\/cdn\.example\.com\/productos\/[0-9a-f-]+\.png$/)
    expect(mocks.send).toHaveBeenCalledTimes(1)
    const command = mocks.send.mock.calls[0][0] as { input: { ContentType: string; Key: string } }
    expect(command.input.ContentType).toBe("image/png")
    expect(command.input.Key).toMatch(/^productos\/[0-9a-f-]+\.png$/)
  })
})
