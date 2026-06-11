require "rails_helper"

RSpec.describe "Rack::Attack throttling", type: :request do
  # Throttles are defined only outside test, so register one like production's
  # and exercise it against an isolated memory store.
  before(:all) do
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
    Rack::Attack.throttle("spec/login/ip", limit: 3, period: 1.minute) do |req|
      req.ip if req.post? && req.path == "/api/v1/auth/login"
    end
    Rack::Attack.enabled = true
  end

  after(:all) do
    Rack::Attack.enabled = false
    Rack::Attack.throttles.delete("spec/login/ip")
  end

  before { Rack::Attack.cache.store.clear }

  it "returns 429 with a JSON error once the limit is exceeded" do
    4.times do
      post "/api/v1/auth/login", params: {email: "x@example.com", password: "wrong"}, as: :json
    end

    expect(response).to have_http_status(:too_many_requests)
    expect(JSON.parse(response.body)["error"]).to match(/too many requests/i)
  end

  it "does not throttle under the limit" do
    2.times do
      post "/api/v1/auth/login", params: {email: "x@example.com", password: "wrong"}, as: :json
    end
    expect(response).to have_http_status(:unauthorized)
  end
end
