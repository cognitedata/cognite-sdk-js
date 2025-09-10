# WireMock Technical Presentation

---

## Slide 1: What/Why/Where WireMock?

### What is WireMock?
- **Open-source API mocking and service virtualization tool**
- Simulates HTTP-based APIs and web services
- Available as Java library, standalone server, or Docker container
- Supports REST APIs, SOAP services, and other HTTP protocols

### Why use WireMock?
- **Isolation**: Test applications without external dependencies
- **Reliability**: Create stable, predictable test environments
- **Speed**: Faster tests without network calls to real services
- **Control**: Simulate various scenarios (errors, delays, edge cases)
- **Early Development**: Work with APIs that don't exist yet

### Where is WireMock used?
- Unit and integration testing
- Development environments
- CI/CD pipelines
- Performance testing
- Microservices architectures

---

## Slide 2: Useful Features of WireMock

### Core Features
- **HTTP Response Stubbing**
  - Match requests by URL, headers, body content, query parameters
  - Support for exact matches, regex patterns, and JSON path matching
  
- **Request Verification**
  - Verify that expected requests were made
  - Check request count, timing, and content

- **Response Templating**
  - Dynamic response generation using Handlebars templates
  - Include request data in responses

### Advanced Capabilities
- **Fault Injection & Delays**
  - Simulate network timeouts, connection resets
  - Add configurable delays to responses
  
- **Stateful Behavior**
  - Model complex scenarios with state machines
  - Support for scenarios and finite state machines

- **Extensibility**
  - Custom request matchers and response transformers
  - Plugin architecture for advanced use cases

---

## Slide 3: Record and Replay Feature

### What is Record and Replay?
- **Capture real API interactions** and save them as stubs
- **Replay captured interactions** for consistent testing
- Bridge between real services and mocked services

### How it Works
1. **Recording Phase**
   - Configure WireMock as a proxy to target API
   - Capture all requests and responses
   - Generate stub mappings automatically

2. **Replay Phase**
   - Use captured stubs instead of real API
   - Consistent, repeatable responses
   - No dependency on external services

### Benefits
- **Quick mock generation** from existing APIs
- **Accurate representations** of real service behavior
- **Offline development** and testing capabilities
- **Regression testing** with real data patterns

### Example Use Case
```json
// Recorded stub example
{
  "request": {
    "method": "GET",
    "url": "/api/users/123"
  },
  "response": {
    "status": 200,
    "body": "{\"id\": 123, \"name\": \"John Doe\"}"
  }
}
```

---

## Slide 4: Proxying

### What is Proxying?
- **Forward requests** to a real API while intercepting specific calls
- **Selective mocking**: Mock some endpoints, proxy others
- **Transparent operation**: Client doesn't know about the proxy

### Proxying Modes
1. **Pass-through Proxying**
   - Forward all unmatched requests to target API
   - Useful for partial mocking scenarios

2. **Recording Proxy**
   - Capture interactions while proxying
   - Build stub library over time

3. **Intercepting Proxy**
   - Modify requests/responses in transit
   - Add headers, transform data, inject faults

### Use Cases
- **Hybrid testing**: Test with mix of real and mocked services
- **API exploration**: Understand API behavior while developing
- **Gradual migration**: Replace real services with mocks incrementally
- **Debugging**: Inspect and modify API traffic

### Configuration Example
```java
// Proxy unmatched requests
wireMockServer.stubFor(any(anyUrl())
    .willReturn(aResponse().proxiedFrom("http://api.example.com")));
```

---

## Slide 5: Scenarios Where We Can Use WireMock

### Development Scenarios
- **API-First Development**
  - Mock APIs before implementation
  - Parallel frontend/backend development
  
- **Third-Party Integration**
  - Mock external services during development
  - Avoid rate limits and costs

### Testing Scenarios
- **Unit Testing**
  - Isolate components from external dependencies
  - Fast, reliable test execution
  
- **Integration Testing**
  - Test service interactions without external calls
  - Simulate various response scenarios

- **End-to-End Testing**
  - Control external service behavior
  - Test error handling and edge cases

### Operational Scenarios
- **Performance Testing**
  - Simulate high-latency responses
  - Test system behavior under various loads
  
- **Chaos Engineering**
  - Inject failures and delays
  - Test system resilience

- **Demo Environments**
  - Stable, predictable demonstrations
  - No dependency on external service availability

---

## Slide 6: Use at Cognite

### Cognite's Context
- **Industrial IoT Platform** with complex data pipelines
- **Multiple microservices** interacting with external systems
- **Real-time data processing** requiring reliable testing

### WireMock Applications at Cognite
- **External API Mocking**
  - Mock industrial equipment APIs
  - Simulate sensor data streams
  - Test data ingestion pipelines

- **Microservices Testing**
  - Mock internal service dependencies
  - Enable independent service development
  - Facilitate integration testing

- **Client SDK Testing**
  - Mock Cognite Data Fusion APIs
  - Test SDK functionality across different scenarios
  - Validate error handling in client libraries

### Benefits Realized
- **Faster Development Cycles**
  - Reduced dependency on external systems
  - Parallel development capabilities
  
- **Improved Test Reliability**
  - Consistent test environments
  - Predictable test outcomes
  
- **Enhanced Debugging**
  - Reproducible issues
  - Better error scenario coverage

---

## Slide 7: Key Takeaways

### Technical Benefits
- **Isolation**: Decouple testing from external dependencies
- **Control**: Simulate any scenario, including edge cases
- **Speed**: Faster tests without network overhead
- **Reliability**: Consistent, predictable responses

### Development Benefits
- **Parallel Development**: Frontend and backend teams work independently
- **Early Testing**: Test against APIs before they're built
- **Comprehensive Coverage**: Test scenarios difficult to reproduce with real services

### Operational Benefits
- **Cost Reduction**: Avoid charges from external API calls during testing
- **Risk Mitigation**: Test failure scenarios safely
- **Documentation**: Stubs serve as API behavior documentation

### Best Practices
- **Start Simple**: Begin with basic stubs, add complexity as needed
- **Maintain Stubs**: Keep mocks in sync with real API changes
- **Use Verification**: Ensure your application makes expected requests
- **Combine Approaches**: Use recording, proxying, and manual stubbing together

---

## Slide 8: Demos

### Demo 1: Basic Stubbing
**Objective**: Create a simple REST API mock
```java
// Java example
wireMockServer.stubFor(get(urlEqualTo("/api/users/123"))
    .willReturn(aResponse()
        .withStatus(200)
        .withHeader("Content-Type", "application/json")
        .withBody("{\"id\": 123, \"name\": \"John Doe\"}")));
```

**What we'll show**:
- Setting up WireMock server
- Creating a simple GET endpoint stub
- Testing with curl/Postman

### Demo 2: Record and Replay
**Objective**: Capture real API interactions
```bash
# Start recording
java -jar wiremock-standalone.jar --port 8080 --proxy-all="https://api.github.com" --record-mappings
```

**What we'll show**:
- Configure WireMock as recording proxy
- Make requests to GitHub API through WireMock
- Examine generated stub files
- Replay without internet connection

### Demo 3: Fault Injection
**Objective**: Simulate network issues
```java
// Simulate timeout
wireMockServer.stubFor(get(urlEqualTo("/api/slow"))
    .willReturn(aResponse()
        .withFixedDelay(5000)
        .withStatus(200)));

// Simulate server error
wireMockServer.stubFor(get(urlEqualTo("/api/error"))
    .willReturn(aResponse()
        .withStatus(500)
        .withBody("Internal Server Error")));
```

**What we'll show**:
- Adding delays to responses
- Simulating HTTP error codes
- Testing application error handling

---

## Slide 9: Questions?

### Discussion Topics
- **Implementation Challenges**
  - How to handle authentication in mocks?
  - Maintaining stub accuracy over time
  - Performance considerations for large test suites

- **Integration Strategies**
  - Best practices for CI/CD integration
  - Stub sharing across teams
  - Version control for mock data

- **Advanced Use Cases**
  - Custom matchers and transformers
  - Stateful scenarios
  - WebSocket mocking

### Resources
- **Official Documentation**: https://wiremock.org/docs/
- **GitHub Repository**: https://github.com/wiremock/wiremock
- **Community**: WireMock Slack, Stack Overflow
- **Extensions**: WireMock ecosystem and plugins

### Contact & Follow-up
- Questions about specific use cases?
- Implementation guidance needed?
- Want to share your WireMock experiences?

**Thank you for your attention!**

---

*This presentation covers WireMock's core concepts, features, and practical applications. Each slide can be expanded with live demonstrations and real-world examples based on your specific audience and use cases.*