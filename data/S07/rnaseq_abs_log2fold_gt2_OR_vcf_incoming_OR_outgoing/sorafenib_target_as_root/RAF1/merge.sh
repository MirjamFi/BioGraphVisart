#!/bin/bash

../../../../../bin/merge_graphs.py S07 \
	                           ../../../../../graphs/kegg/kegg_all_interactions.graphml \
				   optimal.graphml \
				   ../../../../../results/S02/rnaseq_abs_log2fold_gt2_OR_vcf_incoming_OR_outgoing/sorafenib_target_as_root/RAF1/mapping/S07/optimal_mapped.graphml \
				   ../../../../../results/S07/rnaseq_abs_log2fold_gt2_OR_vcf_incoming_OR_outgoing/sorafenib_target_as_terminal/RAF1/optimal.graphml \
				   ../../../../../results/S02/rnaseq_abs_log2fold_gt2_OR_vcf_incoming_OR_outgoing/sorafenib_target_as_terminal/RAF1/mapping/S07/optimal_mapped.graphml
