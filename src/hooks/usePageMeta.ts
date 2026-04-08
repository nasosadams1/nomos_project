import { useEffect } from 'react';

const SITE_NAME = 'Nomos';
const DEFAULT_TITLE = 'Nomos | Legal intake, lawyer discovery, and consultation requests';
const DEFAULT_DESCRIPTION =
  'Nomos helps clients submit structured legal intake, compare verified lawyers, and request consultations with clearer next steps.';

function getOrCreateMetaTag(name: string, attribute: 'name' | 'property') {
  const selector = `meta[${attribute}="${name}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }

  return tag;
}

export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    const nextTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const nextDescription = description ?? DEFAULT_DESCRIPTION;

    document.title = nextTitle;

    getOrCreateMetaTag('description', 'name').content = nextDescription;
    getOrCreateMetaTag('og:title', 'property').content = nextTitle;
    getOrCreateMetaTag('og:description', 'property').content = nextDescription;
    getOrCreateMetaTag('twitter:title', 'name').content = nextTitle;
    getOrCreateMetaTag('twitter:description', 'name').content = nextDescription;
  }, [description, title]);
}

