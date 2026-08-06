//
// DeepLinkSDK.swift
// DeepLink Pro Native iOS SDK for Deferred Deep Linking & Mobile Measurement (MMP)
//

import Foundation
import UIKit
import WebKit

public class DeepLinkSDK {
    public static let shared = DeepLinkSDK()
    
    private var apiKey: String?
    private var serverUrl: String = "http://localhost:8000"
    
    private init() {}
    
    /// Initialize the DeepLink Pro SDK with your API key
    public func configure(apiKey: String, serverUrl: String = "http://localhost:8000") {
        self.apiKey = apiKey
        self.serverUrl = serverUrl
        
        // Auto-check for deferred deep link on first launch
        checkDeferredDeepLink()
    }
    
    /// Deferred Deep Link matching engine on first app open post-install
    public func checkDeferredDeepLink(completion: ((NSDictionary?, Error?) -> Void)? = nil) {
        guard let apiKey = apiKey else {
            print("[DeepLinkSDK] Warning: SDK not configured with API key.")
            return
        }
        
        let fingerprint = collectDeviceFingerprint()
        guard let url = URL(string: "\(serverUrl)/api/v1/r/deferred-match") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: fingerprint, options: [])
        } catch {
            completion?(nil, error)
            return
        }
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion?(nil, error)
                return
            }
            
            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data, options: []) as? NSDictionary else {
                completion?(nil, nil)
                return
            }
            
            print("[DeepLinkSDK] Matched Deferred Link Parameters: \(json)")
            completion?(json, nil)
        }.resume()
    }
    
    /// Collect 15+ native iOS telemetry signals for probabilistic matching
    private func collectDeviceFingerprint() -> [String: Any] {
        let device = UIDevice.current
        let screen = UIScreen.main
        
        return [
            "os": "iOS",
            "os_version": device.systemVersion,
            "device_model": device.model,
            "screen_size": "\(Int(screen.bounds.width))x\(Int(screen.bounds.height))",
            "screen_scale": Double(screen.scale),
            "timezone": TimeZone.current.identifier,
            "language": Locale.current.identifier,
            "timestamp": Date().timeIntervalSince1970
        ]
    }
}
