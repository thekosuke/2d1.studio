// Native macOS deterministic PNG-sequence encoder. No recording or wall-clock timestamps.
import Foundation
import AVFoundation
import ImageIO
import CoreGraphics

let args = CommandLine.arguments
let directory = URL(fileURLWithPath: args[1])
let destination = URL(fileURLWithPath: args[2])
let count = Int(args[3])!, fps = Int32(args[4])!
let width = 1080, height = 1080
let writer = try AVAssetWriter(outputURL: destination, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width, AVVideoHeightKey: height,
    AVVideoColorPropertiesKey: [AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
        AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
        AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2],
    AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 16_000_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        AVVideoMaxKeyFrameIntervalKey: Int(fps), AVVideoExpectedSourceFrameRateKey: Int(fps)]
])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
    kCVPixelBufferWidthKey as String: width, kCVPixelBufferHeightKey as String: height,
    kCVPixelBufferCGImageCompatibilityKey as String: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
])
writer.add(input)
guard writer.startWriting() else { fatalError("Cannot start: \(String(describing: writer.error))") }
writer.startSession(atSourceTime: .zero)
for index in 0..<count {
    while !input.isReadyForMoreMediaData {
        if writer.status == .failed { fatalError("Encoder failed: \(String(describing: writer.error))") }
        Thread.sleep(forTimeInterval: 0.002)
    }
    try autoreleasepool {
        let url = directory.appendingPathComponent(String(format: "%05d.png", index))
        guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
              let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else { fatalError("Missing frame \(index)") }
        var optional: CVPixelBuffer?
        guard CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &optional) == kCVReturnSuccess,
              let buffer = optional else { fatalError("Pixel buffer allocation failed") }
        CVPixelBufferLockBaseAddress(buffer, [])
        let context = CGContext(data: CVPixelBufferGetBaseAddress(buffer), width: width, height: height,
            bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
            space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
        context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
        CVPixelBufferUnlockBaseAddress(buffer, [])
        guard adaptor.append(buffer, withPresentationTime: CMTime(value: Int64(index), timescale: fps)) else {
            fatalError("Append failed: \(String(describing: writer.error))")
        }
    }
}
writer.endSession(atSourceTime: CMTime(value: Int64(count), timescale: fps))
input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
guard writer.status == .completed else { fatalError("Export failed: \(String(describing: writer.error))") }
let asset = AVURLAsset(url: destination)
let track = asset.tracks(withMediaType: .video).first!
print("Verified \(Int(track.naturalSize.width)) × \(Int(track.naturalSize.height)), \(track.nominalFrameRate) fps, \(CMTimeGetSeconds(asset.duration)) seconds, \(asset.tracks(withMediaType: .audio).count) audio tracks")
