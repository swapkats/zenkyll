module Api::V1
  class TokensController < ApiController
    def create
      @token = Token.where(:user => current_user, :provider => params[:provider]).first
      @token ||= Token.new({
        provider: params[:provider],
        token: params[:token],
        user: current_user,
        scope: params[:scope]
      })
      @token.token = params[:token]
      @token.scope = params[:scope]
      @token.save
      # if user_token_exists
      #   # user_token.update({
      #   #   token: params[:token],
      #   # })
      # else
      #   Token.create({
      #     provider: params[:provider],
      #     token: params[:token],
      #     user: current_user,
      #   })
      #end
    end
  end
end
