'use client'

import type { Excerpt } from "@/app/_lib/definitions";

const List = ({
  excerpts
}: {
  excerpts: Excerpt[]
}) => {
  return (
    <>
      {excerpts}
    </>
  );
}

export default List;
