require 'net/https'
require 'open-uri'

class ApplicationController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken

  def github_callback
    code = params['code']
    form_data = {
      client_id: '2a162c4057c7c5b9e020',
      client_secret: '4204f95f0cde0c9decaeef9c6a018893bdbfd0fe',
      code: code
    }
    res = post_api_call('https://github.com/login/oauth/access_token',form_data)
    redirect_to "http://localhost:3000/?code=#{res}"
  end

  def post_api_call(url, form_data)
    uri = URI.parse(url)
    uri.query = URI.encode_www_form(form_data)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    request = Net::HTTP::Post.new(uri.request_uri)
    http.request(request).body.split('=')[1]
  end
end
