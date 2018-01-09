module Api::V1
  class SitesController < ApiController
    def index
      Site.where(:user => current_user)
    end

    def create
      @site = Site.where(:user => current_user, :repo => params[:repo]).first
      @site ||= Site.new({
        name: params[:name],
        repo: params[:repo],
        branch: params[:branch],
        user: current_user,
      })
      @site.name = params[:name]
      @site.branch = params[:branch]
      @site.save
    end
  end
end
