'use client'

import type { Excerpt } from '@/app/_lib/definitions';

const FilterForm = ({
  excerpts
}: {
  excerpts: Excerpt[]
}) => {
  return (
    <>
      {excerpts}
    </>
  );
};

export default FilterForm;
