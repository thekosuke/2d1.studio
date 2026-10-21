// Native macOS asset preparation; not a website runtime dependency.
// swiftc -suppress-warnings optimize-aviator-video.swift -o /tmp/aviator-video
// /tmp/aviator-video input.mp4 output.mp4
import AVFoundation
import Foundation

let source = AVURLAsset(url: URL(fileURLWithPath: CommandLine.arguments[1]))
let destination = URL(fileURLWithPath: CommandLine.arguments[2])
let size = CGSize(width: 1920, height: 1080)
guard let track = source.tracks(withMediaType: .video).first else {
    fatalError("No video track")
}
let reader = try AVAssetReader(asset: source)
let output = AVAssetReaderVideoCompositionOutput(videoTracks: [track], videoSettings: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA
])
let composition = AVMutableVideoComposition()
composition.renderSize = size
composition.frameDuration = CMTime(value: 1, timescale: 30)
let instruction = AVMutableVideoCompositionInstruction()
instruction.timeRange = CMTimeRange(start: .zero, duration: source.duration)
let layer = AVMutableVideoCompositionLayerInstruction(assetTrack: track)
let scale = size.width / track.naturalSize.width
layer.setTransform(track.preferredTransform.concatenating(CGAffineTransform(scaleX: scale, y: scale)), at: .zero)
instruction.layerInstructions = [layer]
composition.instructions = [instruction]
output.videoComposition = composition
reader.add(output)

let writer = try AVAssetWriter(outputURL: destination, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: Int(size.width), AVVideoHeightKey: Int(size.height),
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 2_500_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        AVVideoMaxKeyFrameIntervalKey: 60
    ]
])
input.expectsMediaDataInRealTime = false
writer.add(input)
guard reader.startReading(), writer.startWriting() else {
    fatalError("Cannot start video conversion")
}
writer.startSession(atSourceTime: .zero)
let done = DispatchSemaphore(value: 0)
input.requestMediaDataWhenReady(on: DispatchQueue(label: "aviator-video")) {
    while input.isReadyForMoreMediaData {
        if let sample = output.copyNextSampleBuffer() {
            guard input.append(sample) else {
                reader.cancelReading(); input.markAsFinished()
                writer.cancelWriting(); done.signal(); return
            }
        } else {
            input.markAsFinished()
            writer.finishWriting { done.signal() }
            return
        }
    }
}
done.wait()
guard writer.status == .completed, reader.status == .completed else {
    fatalError("Video conversion failed: \(String(describing:writer.error ?? reader.error))")
}
print("Exported 1080p H.264 without audio: \(destination.path)")
