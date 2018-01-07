Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  mount_devise_token_auth_for 'User', at: 'api/auth', controllers: {
    token_validations:  'overrides/token_validations'
  }
  namespace :api do
    namespace :v1 do
      resource :token, only: [:create]
    end
  end

  get 'auth/callback/github', to: 'api#github_callback'

  #Do not place any routes below this one
  get '*path', to: "application#fallback_index_html", constraints: ->(request) do
    !request.xhr? && request.format.html?
  end
end
