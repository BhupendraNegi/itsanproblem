Rails.application.routes.draw do
  devise_for :users

  namespace :api do
    namespace :v1 do
      scope :auth do
        post "register", to: "auth#register"
        post "login", to: "auth#login"
        delete "logout", to: "auth#logout"
        post "forgot_password", to: "auth#forgot_password"
        post "reset_password", to: "auth#reset_password"
      end

      resources :posts, only: [:index, :show, :create] do
        resources :comments, only: [:create]
        resource :helpful_mark, only: [:create, :destroy]
        resource :flag, only: [:create]
      end

      resources :comments, only: [] do
        resource :helpful_mark, only: [:create, :destroy]
        resource :flag, only: [:create]
      end

      resource :profile, only: [:update], controller: "profiles" do
        patch :password
      end

      resources :notifications, only: [:index] do
        patch :read_all, on: :collection
      end

      resources :users, only: [:show]

      namespace :admin do
        get :stats, to: "stats#show"
        resources :flags, only: [:index]
        resources :posts, only: [:destroy] do
          patch :restore, on: :member
        end
        resources :comments, only: [:destroy] do
          patch :restore, on: :member
        end
        resources :users, only: [:index, :destroy] do
          member do
            patch :role
            post :impersonate
          end
        end
      end
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", :as => :rails_health_check
end
