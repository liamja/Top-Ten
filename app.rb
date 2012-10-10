require 'youtube_it'
require 'lastfm'
# require 'rack/cache'
require 'sinatra/base'

class TopTen < Sinatra::Base

	configure do
		# use Rack::Cache
		# Configure public directory
		set :public_folder, File.join(File.dirname(__FILE__), 'public')
		# Configure HAML and SASS
		set :haml, { :format => :html5 }
		# set :sass, { :style => :compressed } if ENV['RACK_ENV'] == 'production'
	end

	before do
		cache_control :public, :max_age => 604800
	end

	get '/' do
		haml :front
	end

	get '/*:artist' do
		@artist_name = params[:artist].split(' ').map {|w| w.capitalize }.join(' ')

		# Setup API params
		@yt = YouTubeIt::Client.new
		lastfm = Lastfm.new(ENV['LASTFM_API_KEY'], ENV['LASTFM_API_TOKEN'])

		begin
			@tracks = lastfm.artist.get_top_tracks(:artist => @artist_name, :limit => '10')
		rescue Exception => e
			
		end

		@tracks.each do |track|
			track[:video_id] = @yt.videos_by(:query => "#{@artist_name} #{track['name']}", :page => 1, :per_page => 1).videos.first.unique_id
		end
		
		haml :player
	end

end