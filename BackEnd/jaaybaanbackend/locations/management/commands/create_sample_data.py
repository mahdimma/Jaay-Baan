from django.core.management.base import BaseCommand
from locations.models import Location


class Command(BaseCommand):
    help = "Create sample data for testing the system"

    def handle(self, *args, **options):
        self.stdout.write("Creating sample data...")

        # Create root location (House)
        house = Location.add_root(
            name="خانه من",
            location_type="house",
            description="خانه اصلی",
            is_container=True,
        )

        # Create rooms
        living_room = house.add_child(
            name="اتاق نشیمن",
            location_type="room",
            description="اتاق نشیمن اصلی خانه",
            is_container=True,
        )

        bedroom = house.add_child(
            name="اتاق خواب",
            location_type="room",
            description="اتاق خواب اصلی",
            is_container=True,
        )

        kitchen = house.add_child(
            name="آشپزخانه",
            location_type="room",
            description="آشپزخانه",
            is_container=True,
        )

        # Create storage areas in living room
        tv_shelf = living_room.add_child(
            name="قفسه تلویزیون",
            location_type="shelf",
            description="قفسه کنار تلویزیون",
            is_container=True,
        )

        # Create containers
        drawer1 = tv_shelf.add_child(
            name="کشو اول",
            location_type="container",
            description="کشو بالایی قفسه تلویزیون",
            is_container=True,
        )

        drawer2 = tv_shelf.add_child(
            name="کشو دوم",
            location_type="container",
            description="کشو پایینی قفسه تلویزیون",
            is_container=True,
        )

        # Create items
        drawer1.add_child(
            name="ریموت تلویزیون",
            location_type="item",
            description="ریموت کنترل تلویزیون سامسونگ",
            is_container=False,
            barcode="TV_REMOTE_001",
            quantity=1,
            value=50000,
        )

        drawer1.add_child(
            name="کابل HDMI",
            location_type="item",
            description="کابل HDMI برای اتصال دستگاه‌ها",
            is_container=False,
            barcode="HDMI_CABLE_001",
            quantity=2,
            value=25000,
        )

        drawer2.add_child(
            name="کتاب‌های مجله",
            location_type="item",
            description="مجموعه مجله‌های علمی",
            is_container=False,
            quantity=5,
            value=100000,
        )

        # Create bedroom storage
        wardrobe = bedroom.add_child(
            name="کمد لباس",
            location_type="storage",
            description="کمد اصلی اتاق خواب",
            is_container=True,
        )

        wardrobe_shelf1 = wardrobe.add_child(
            name="طبقه اول کمد",
            location_type="shelf",
            description="طبقه بالایی کمد",
            is_container=True,
        )

        wardrobe_shelf1.add_child(
            name="لباس‌های زمستانی",
            location_type="item",
            description="پالتو و لباس‌های گرم",
            is_container=False,
            quantity=10,
        )

        # Create kitchen storage
        kitchen_cabinet = kitchen.add_child(
            name="کابینت آشپزخانه",
            location_type="storage",
            description="کابینت اصلی آشپزخانه",
            is_container=True,
        )

        upper_cabinet = kitchen_cabinet.add_child(
            name="کابینت بالایی",
            location_type="container",
            description="کابینت بالایی آشپزخانه",
            is_container=True,
        )

        upper_cabinet.add_child(
            name="ظروف شیشه‌ای",
            location_type="item",
            description="ست ظروف شیشه‌ای",
            is_container=False,
            barcode="GLASS_SET_001",
            quantity=6,
            value=200000,
        )

        upper_cabinet.add_child(
            name="ادویه‌جات",
            location_type="item",
            description="مجموعه ادویه‌جات آشپزخانه",
            is_container=False,
            quantity=15,
            value=150000,
        )

        self.stdout.write(self.style.SUCCESS("Successfully created sample data!"))

        # Print summary
        total_locations = Location.objects.count()
        containers = Location.objects.filter(is_container=True).count()
        items = Location.objects.filter(is_container=False).count()

        self.stdout.write(f"Total locations created: {total_locations}")
        self.stdout.write(f"Containers: {containers}")
        self.stdout.write(f"Items: {items}")
