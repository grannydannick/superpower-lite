import { useProducts } from '@/features/action-plan/api';
import { useServices } from '@/features/services/api';
import { PlanGoalItem } from '@/types/api';

export const PlanItemList = ({ item }: { item: PlanGoalItem }) => {
  const servicesQuery = useServices();
  const productsQuery = useProducts();

  switch (item.itemType) {
    case 'PRODUCT': {
      const product = productsQuery.data?.products.find(
        (product) => product.id === item.itemId,
      );

      return product ? (
        <li className="text-base text-vermillion-900">
          <span className="text-zinc-600">
            {product.name} {item.description ? `- ${item.description}` : null}
          </span>
        </li>
      ) : null;
    }
    case 'SERVICE': {
      const service = servicesQuery.data?.services.find(
        (service) => service.id === item.itemId,
      );
      return service ? (
        <li className="text-base text-vermillion-900">
          <span className="text-zinc-600">
            {service.name} {item.description ? `- ${item.description}` : null}
          </span>
        </li>
      ) : null;
    }
  }
};
