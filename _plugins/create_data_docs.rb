Jekyll::Hooks.register :site, :post_write do |site|
    puts 'Jekyll post_write hook in create_data_docs.rb: running _tools/createdatadocs.py'
    system 'python3 _tools/createdatadocs.py'
end
