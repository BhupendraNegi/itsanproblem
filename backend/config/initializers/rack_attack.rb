# Anti-abuse throttles. The gem's railtie inserts the middleware; counters
# live in Rails.cache (memory in dev, Solid Cache in production).
#
# Limits are per-IP because auth payloads are JSON (Rack::Attack can't see
# into the body without parsing it on every request) and content endpoints
# are the cheapest spam vector on an anonymous board.
class Rack::Attack
  unless Rails.env.test?
    # credential stuffing / brute force
    throttle("auth/login/ip", limit: 10, period: 1.minute) do |req|
      req.ip if req.post? && req.path == "/api/v1/auth/login"
    end

    # mass account creation
    throttle("auth/register/ip", limit: 5, period: 1.hour) do |req|
      req.ip if req.post? && req.path == "/api/v1/auth/register"
    end

    # post/comment spam
    throttle("content/posts/ip", limit: 10, period: 5.minutes) do |req|
      req.ip if req.post? && req.path == "/api/v1/posts"
    end

    throttle("content/comments/ip", limit: 30, period: 5.minutes) do |req|
      req.ip if req.post? && req.path.match?(%r{\A/api/v1/posts/\d+/comments\z})
    end
  end

  self.throttled_responder = lambda do |_req|
    [429, {"Content-Type" => "application/json"},
      [{error: "Too many requests — please slow down."}.to_json]]
  end
end
