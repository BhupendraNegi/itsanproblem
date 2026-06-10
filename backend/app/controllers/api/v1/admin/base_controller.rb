module Api
  module V1
    module Admin
      class BaseController < ApplicationController
        before_action :authenticate_user!
        before_action :require_admin!

        private

        def require_admin!
          authorize! :admin, to: :access?
        end
      end
    end
  end
end
