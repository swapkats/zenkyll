module Overrides
  class TokenValidationsController < DeviseTokenAuth::TokenValidationsController

    def validate_token
      # @resource will have been set by set_user_by_token concern
      if @resource
        token = Token.where(:user => current_user).first
        render json: {
          token: token,
          data: @resource.as_json
        }
      else
        render json: {
          success: false,
          errors: ["Invalid login credentials"]
        }, status: 401
      end
    end
  end
end
