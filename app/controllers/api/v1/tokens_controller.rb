module Api::V1
  class TokensController < ApiController
    def create
      Token.create({
        provider: params[:provider],
        token: params[:token],
        user: current_user,
      })
    end
  end
end
