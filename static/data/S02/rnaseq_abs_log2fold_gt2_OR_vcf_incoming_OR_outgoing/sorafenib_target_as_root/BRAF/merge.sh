#!/bin/bash

../../../../../bin/merge_graphs.py S02 \
	                           ../../../../../graphs/kegg/kegg_all_interactions.graphml \
				   optimal.graphml \
				   ../../../../../results/S07/rnaseq_abs_log2fold_gt2_OR_vcf_incoming_OR_outgoing/sorafenib_target_as_root/BRAF/mapping/S02/optimal_mapped.graphml 
