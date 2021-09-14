require 'json'
require 'tempfile'

Jekyll::Hooks.register :site, :pre_render do |site|
    # The Polyglot plugin launches a Jekyll build per language, optionally in
    # parallel, meaning that this hook will be called once for each language.
     
	out_path = '_data/docs_' + site.active_lang + '.json'
    
	if File.exist?(out_path)
		puts 'INFO: pre-render hook deletes the existing ' + out_path
	    File.delete(out_path)
    end

    puts 'INFO: pre-render hook begins to create ' + out_path
    
	docs_by_title = {}
	top_level_docs = []
	prev_doc_md = nil
	
    for doc in site.collections['docs'].docs
	    doc_md = {
	    	url: doc.url,
	    	title: doc.data['title'],
	    	parent: doc.data['parent'],
	    	relative_path: doc.relative_path,
	    	children: [], # populated as each child is encountered,
	    	previous_title: nil, # populated lower down if prev_doc_md != nil,
	    	previous_url: nil,   # populated lower down if prev_doc_md != nil,
	    	next_title: nil, # populated in the next loop iteration if there is one
	    	next_url: nil,   # populated in the next loop iteration if there is one
	    	breadcrumbs: []  # populated lower down if this doc has ancestors
	    }

		unless prev_doc_md.nil?
			doc_md[:previous_title] = prev_doc_md[:title]
			doc_md[:previous_url] = prev_doc_md[:url]
		    prev_doc_md[:next_title] = doc_md[:title]
		    prev_doc_md[:next_url] = doc_md[:url]
		end
		
	    docs_by_title[doc_md[:title]] = doc_md
	    prev_doc_md = doc_md
	# end

	# docs_by_title.each_value { |doc_md|
		# Note the (valid) assumption that parents always precede their children
		# in site.collections['docs'] in the code that follows.
	    if doc_md[:parent].nil?
		    top_level_docs << doc_md
		else
			# Append to the children of the immediate parent
		    anc_doc_md = docs_by_title[doc_md[:parent]]
		    if anc_doc_md.nil?
			    puts 'WARNING: the parent of "' + doc_md[:title] + '" is "' + \
				    doc_md[:parent] + '" but could not be found.'
		    else
				anc_doc_md[:children] << doc_md 
			end
			
		    while !anc_doc_md.nil?
				# Continue up the ancestor chain to build breadcrumbs
				doc_md[:breadcrumbs] << {
					title: anc_doc_md[:title],
					url: anc_doc_md[:url]
			    }

			    anc_doc_md = docs_by_title[anc_doc_md[:parent]]
		    end
	    end
    end

    docs_md = {
    	by_title: docs_by_title,
    	hierarchy: top_level_docs
    }
    
    # puts JSON.pretty_generate(docs_by_title)

	File.open(out_path, 'a') { |f|
		f.flock(File::LOCK_EX)
	    f.write(JSON.pretty_generate(docs_md))
	}
end
